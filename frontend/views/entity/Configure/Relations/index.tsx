import {
  ErrorAlert,
  FormSkeleton,
  FormSkeletonSchema,
  SectionBox,
  SortList,
  Spacer,
  Tabs,
  Text,
} from "@gothicgeeks/design-system";
import {
  ENTITY_RELATIONS_ENDPOINT,
  useEntityFields,
  useEntityReferenceFields,
  useEntityRelationsList,
} from "frontend/hooks/entity/entity.store";
import { SLUG_LOADING_VALUE, useRouteParam } from "@gothicgeeks/shared";
import { useChangeRouterParam, useSetPageTitle } from "frontend/lib/routing";
import { EntitiesSelection } from "frontend/views/settings/Entities/Selection";
import { useEntityDictionPlurals } from "frontend/hooks/entity/entity.queries";
import { useEntitySlug } from "../../../../hooks/entity/entity.config";
import { BaseEntitySettingsLayout } from "../_Base";
import {
  useEntityConfiguration,
  useUpsertConfigurationMutation,
} from "../../../../hooks/configuration/configration.store";
import { EntityRelationsForm } from "./Relations.form";
import { createViewStateMachine } from "../../useViewStateMachine";
import { ENTITY_CONFIGURATION_VIEW } from "../constants";
import { FieldsLabelForm } from "../Fields/FieldsLabel.form";

export function EntityRelationsSettings() {
  const entity = useEntitySlug();
  const tabFromUrl = useRouteParam("tab");
  const changeTabParam = useChangeRouterParam("tab");
  const entityFields = useEntityFields(entity);
  const entityRelationList = useEntityRelationsList(entity);
  const referenceFields = useEntityReferenceFields(entity);
  useSetPageTitle("Relationship Settings", ENTITY_CONFIGURATION_VIEW);

  const entityRelationTemplate = useEntityConfiguration<{
    format: string;
  }>("entity_relation_template", entity);

  const hiddenEntityRelations = useEntityConfiguration<string[]>(
    "hidden_entity_relations",
    entity
  );

  const getEntitiesDictionPlurals = useEntityDictionPlurals(
    (entityRelationList.data || []).map((value) => ({ value })),
    "value"
  );

  const entityRelationsLabelsMap = useEntityConfiguration<
    Record<string, string>
  >("entity_relations_labels", entity);

  const upsertEntityRelationTemplateMutation = useUpsertConfigurationMutation(
    "entity_relation_template",
    entity
  );

  const upsertEntityRelationsLabelsMutation = useUpsertConfigurationMutation(
    "entity_relations_labels",
    entity,
    {
      otherEndpoints: [ENTITY_RELATIONS_ENDPOINT(entity)],
    }
  );

  const upsertEntityRelationsOrderMutation = useUpsertConfigurationMutation(
    "entity_relations_order",
    entity,
    {
      otherEndpoints: [ENTITY_RELATIONS_ENDPOINT(entity)],
    }
  );

  const upsertHideEntityRelationMutation = useUpsertConfigurationMutation(
    "hidden_entity_relations",
    entity,
    {
      otherEndpoints: [ENTITY_RELATIONS_ENDPOINT(entity)],
    }
  );

  const error =
    entityRelationTemplate.error ||
    entityFields.error ||
    referenceFields.error ||
    entityRelationList.error ||
    hiddenEntityRelations.error;

  const isLoading =
    entityFields.isLoading ||
    entityRelationList.isLoading ||
    entityRelationTemplate.isLoading ||
    hiddenEntityRelations.isLoading ||
    referenceFields.isLoading ||
    entity === SLUG_LOADING_VALUE;

  const viewStateMachine = createViewStateMachine(isLoading, error);

  return (
    <BaseEntitySettingsLayout>
      <SectionBox title="Relationship Settings">
        <Tabs
          currentTab={tabFromUrl}
          onChange={changeTabParam}
          contents={[
            {
              content: (
                <>
                  {viewStateMachine.type === "error" && (
                    <ErrorAlert message={viewStateMachine.message} />
                  )}
                  {viewStateMachine.type === "loading" && (
                    <FormSkeleton schema={[FormSkeletonSchema.Input]} />
                  )}
                  {viewStateMachine.type === "render" && (
                    <>
                      <Text size="5">
                        You get to customize how this entity gets to be rendered
                        when other entity references it
                      </Text>
                      <Spacer />
                      <EntityRelationsForm
                        onSubmit={async (values) => {
                          await upsertEntityRelationTemplateMutation.mutateAsync(
                            values as unknown as Record<string, string>
                          );
                        }}
                        entityFields={(entityFields.data || []).map(
                          ({ name }) => name
                        )}
                        initialValues={entityRelationTemplate.data}
                      />
                    </>
                  )}
                </>
              ),
              label: "Reference Template",
            },
            {
              content: (
                <>
                  {viewStateMachine.type === "error" && (
                    <ErrorAlert message={viewStateMachine.message} />
                  )}
                  <Text size="5">
                    You get the customize the labels, for the field, Say you
                    want `updatedAt` to be called `Last Updated`. Here is where
                    you that
                  </Text>
                  <Spacer />
                  <FieldsLabelForm
                    isLoading={viewStateMachine.type === "loading"}
                    initialValues={entityRelationsLabelsMap.data}
                    fields={(referenceFields.data || []).map(
                      ({ table }) => table
                    )}
                    onSubmit={async (data) => {
                      await upsertEntityRelationsLabelsMutation.mutateAsync(
                        data as Record<string, string>
                      );
                    }}
                  />
                </>
              ),
              label: "Labels",
            },
            {
              content: (
                <EntitiesSelection
                  description="Disable entitites that you dont want to appear anywhere in the app"
                  isLoading={viewStateMachine.type === "loading"}
                  allList={entityRelationList.data || []}
                  getEntityFieldLabels={(relation) =>
                    entityRelationsLabelsMap.data?.[relation] ||
                    getEntitiesDictionPlurals(relation)
                  }
                  hiddenList={hiddenEntityRelations.data || []}
                  onSubmit={async (data) => {
                    await upsertHideEntityRelationMutation.mutateAsync(data);
                  }}
                />
              ),
              label: "Selection",
            },
            {
              content: (
                <>
                  <Text size="5">
                    Order the relations how you want them to appear
                  </Text>
                  <Spacer size="xl" />
                  <SortList
                    data={{
                      ...referenceFields,
                      data: (referenceFields.data || []).map(
                        ({ table, label }) => ({
                          value: table,
                          label: label || getEntitiesDictionPlurals(table),
                        })
                      ),
                    }}
                    onSave={async (data) => {
                      await upsertEntityRelationsOrderMutation.mutateAsync(
                        data
                      );
                    }}
                  />
                </>
              ),
              label: "Order",
            },
          ]}
        />
      </SectionBox>
    </BaseEntitySettingsLayout>
  );
}
