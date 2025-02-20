import React, { useState } from "react";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { DropdownItem, Select, SelectOption } from "@patternfly/react-core";

import type ClientScopeRepresentation from "keycloak-admin/lib/defs/clientScopeRepresentation";
import type KeycloakAdminClient from "keycloak-admin";

export enum ClientScope {
  default = "default",
  optional = "optional",
}

export enum AllClientScopes {
  none = "none",
}

export type ClientScopeType = ClientScope;
export type AllClientScopeType = ClientScope | AllClientScopes;

const clientScopeTypes = Object.keys(ClientScope);
export const allClientScopeTypes = Object.keys({
  ...AllClientScopes,
  ...ClientScope,
});

export const clientScopeTypesSelectOptions = (
  t: TFunction,
  scopeTypes: string[] | undefined = clientScopeTypes
) =>
  scopeTypes.map((type) => (
    <SelectOption key={type} value={type}>
      {t(`common:clientScope.${type}`)}
    </SelectOption>
  ));

export const clientScopeTypesDropdown = (
  t: TFunction,
  onClick: (scope: ClientScopeType) => void
) =>
  clientScopeTypes.map((type) => (
    <DropdownItem key={type} onClick={() => onClick(type as ClientScopeType)}>
      {t(`common:clientScope.${type}`)}
    </DropdownItem>
  ));

type CellDropdownProps = {
  clientScope: ClientScopeRepresentation;
  type: ClientScopeType | AllClientScopeType;
  all?: boolean;
  onSelect: (value: ClientScopeType | AllClientScopeType) => void;
};

export const CellDropdown = ({
  clientScope,
  type,
  onSelect,
  all = false,
}: CellDropdownProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Select
      className={`keycloak__client-scope__${type}`}
      key={clientScope.id}
      onToggle={() => setOpen(!open)}
      isOpen={open}
      selections={[type]}
      onSelect={(_, value) => {
        onSelect(
          all ? (value as ClientScopeType) : (value as AllClientScopeType)
        );
        setOpen(false);
      }}
    >
      {clientScopeTypesSelectOptions(
        t,
        all ? allClientScopeTypes : clientScopeTypes
      )}
    </Select>
  );
};

export type ClientScopeDefaultOptionalType = ClientScopeRepresentation & {
  type: AllClientScopeType;
};

export const changeScope = async (
  adminClient: KeycloakAdminClient,
  clientScope: ClientScopeDefaultOptionalType,
  changeTo: AllClientScopeType
) => {
  await removeScope(adminClient, clientScope);
  await addScope(adminClient, clientScope, changeTo);
};

const castAdminClient = (adminClient: KeycloakAdminClient) =>
  (adminClient.clientScopes as unknown) as {
    [index: string]: Function;
  };

export const removeScope = async (
  adminClient: KeycloakAdminClient,
  clientScope: ClientScopeDefaultOptionalType
) => {
  if (clientScope.type !== AllClientScopes.none)
    await castAdminClient(adminClient)[
      `delDefault${
        clientScope.type === ClientScope.optional ? "Optional" : ""
      }ClientScope`
    ]({
      id: clientScope.id!,
    });
};

const addScope = async (
  adminClient: KeycloakAdminClient,
  clientScope: ClientScopeDefaultOptionalType,
  type: AllClientScopeType
) => {
  if (type !== AllClientScopes.none)
    await castAdminClient(adminClient)[
      `addDefault${type === ClientScope.optional ? "Optional" : ""}ClientScope`
    ]({
      id: clientScope.id!,
    });
};
