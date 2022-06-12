import { AppLayout } from "../../_layouts/app";
import {
  ErrorAlert,
  FormButton,
  FormInput,
  SectionBox,
  SectionCenter,
} from "@gothicgeeks/design-system";
import {
  ButtonLang,
  composeValidators,
  maxLength,
  required,
  TitleLang,
} from "@gothicgeeks/shared";
import { Form, Field } from "react-final-form";
import { IEntityField } from "../../../backend/entities/types";
import { NAVIGATION_LINKS } from "../../lib/routing/links";
import {
  useEntityDiction,
  useEntitySlug,
} from "../../hooks/entity/entity.config";
import { useEntityScalarFields } from "../../hooks/entity/entity.store";
import { Plus, Save } from "react-feather";
import { useRouter } from "next/router";

export function EntityCreate() {
  const entity = useEntitySlug();
  const entityDiction = useEntityDiction();
  const entityScalarFields = useEntityScalarFields(entity);
  const router = useRouter();

  const onSubmit = () => {};
  // TODo handle loading || error;
  return (
    <AppLayout
      breadcrumbs={[
        {
          label: entityDiction.plural,
          value: NAVIGATION_LINKS.ENTITY.TABLE(entity),
        },
        { label: "Create", value: NAVIGATION_LINKS.ENTITY.CREATE(entity) },
      ]}
      actionItems={[
        {
          label: "CRUD Settings",
          IconComponent: Save,
          onClick: () =>
            router.push(NAVIGATION_LINKS.ENTITY.CONFIG.CRUD(entity)),
        },
        {
          label: "Create Settings",
          IconComponent: Plus,
          onClick: () =>
            router.push(NAVIGATION_LINKS.ENTITY.CONFIG.CREATE(entity)),
        },
        {
          label: "Entity Fields",
          IconComponent: Plus,
          onClick: () =>
            router.push(NAVIGATION_LINKS.ENTITY.CONFIG.FIELDS(entity)),
        },
      ]}
    >
      <SectionCenter>
        <SectionBox
          title={TitleLang.create(entityDiction.singular)}
          backLink={{
            link: NAVIGATION_LINKS.ENTITY.TABLE(entity),
            label: entityDiction.plural,
          }}
        >
          <ErrorAlert message={"error"} />
          <CreateEntityForm
            onSubmit={onSubmit}
            fields={entityScalarFields.data || []}
            resetForm={false}
          />
        </SectionBox>
      </SectionCenter>
    </AppLayout>
  );
}

export const CreateEntityForm: React.FC<{
  fields: IEntityField[];
  onSubmit: () => void;
  resetForm: boolean;
}> = ({ onSubmit, resetForm, fields }) => {
  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, form, values, submitting }) => {
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e)?.then(() => {
                //   resetFormValues(resetForm, values, form);
              });
            }}
          >
            {fields.map(({ name }) => {
              return (
                <Field
                  key={name}
                  name={name}
                  validate={composeValidators(required, maxLength(32))}
                  validateFields={[]}
                >
                  {(renderProps) => (
                    <FormInput label={name} required={true} {...renderProps} />
                  )}
                </Field>
              );
            })}
            <FormButton
              text={ButtonLang.create}
              isMakingRequest={submitting}
            />
          </form>
        );
      }}
    />
  );
};