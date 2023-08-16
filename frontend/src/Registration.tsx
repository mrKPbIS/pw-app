import * as React from "react";
import { styled } from "@mui/material/styles";
import { Button, CardContent, CircularProgress } from "@mui/material";
import { required, useTranslate, useNotify, useSafeSetState } from "ra-core";
import { TextInput, Form, useAuthProvider } from "react-admin";
import { CustomAuthProvider } from "./authProvider";
import { useNavigate } from "react-router-dom";

export const RegistrationForm = () => {
  const [loading, setLoading] = useSafeSetState(false);
  const translate = useTranslate();
  const notify = useNotify();
  const authProvider = useAuthProvider<CustomAuthProvider>();
  const navigate = useNavigate();

  const submit = (values: FormData) => {
    setLoading(true);
    authProvider
      .register(values)
      .then(() => {
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        notify(
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
            ? "ra.auth.sign_in_error"
            : error.message,
          {
            type: "error",
            messageArgs: {
              _:
                typeof error === "string"
                  ? error
                  : error && error.message
                  ? error.message
                  : undefined,
            },
          },
        );
      });
  };

  return (
    <StyledForm onSubmit={submit} mode="onChange" noValidate>
      <CardContent className={LoginFormClasses.content}>
        <TextInput
          autoFocus
          source="email"
          label="Email"
          autoComplete="email"
          validate={required()}
          fullWidth
        />
        <TextInput
          source="name"
          label={translate("ra.auth.username")}
          autoComplete="name"
          validate={required()}
          fullWidth
        />
        <TextInput
          source="password"
          label={translate("ra.auth.password")}
          type="password"
          validate={[required()]}
          fullWidth
        />
        <TextInput
          source="checkPassword"
          label={translate("ra.auth.password")}
          type="password"
          validate={[required()]}
          fullWidth
        />
        <Button
          variant="contained"
          type="submit"
          color="primary"
          disabled={loading}
          fullWidth
          className={LoginFormClasses.button}
        >
          {loading ? (
            <CircularProgress
              className={LoginFormClasses.icon}
              size={19}
              thickness={3}
            />
          ) : (
            "Sign up"
          )}
        </Button>
      </CardContent>
    </StyledForm>
  );
};

const PREFIX = "RaLoginForm";

export const LoginFormClasses = {
  content: `${PREFIX}-content`,
  button: `${PREFIX}-button`,
  icon: `${PREFIX}-icon`,
};

const StyledForm = styled(Form, {
  name: PREFIX,
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
  [`& .${LoginFormClasses.content}`]: {
    width: 300,
  },
  [`& .${LoginFormClasses.button}`]: {
    marginTop: theme.spacing(2),
  },
  [`& .${LoginFormClasses.icon}`]: {
    margin: theme.spacing(0.3),
  },
}));

interface FormData {
  email?: string;
  name?: string;
  password?: string;
  checkPassword?: string;
}
