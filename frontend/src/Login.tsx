import * as React from "react";
import { styled, ThemeProvider } from "@mui/material/styles";
import PropTypes from "prop-types";
import { Button, CardContent, CircularProgress, CssBaseline, Paper, ScopedCssBaseline } from "@mui/material";
import {
  required,
  useTranslate,
  useLogin,
  useNotify,
  useSafeSetState,
} from "ra-core";
import { LoginFormProps, TextInput, Form } from "react-admin";
import { useNavigate } from "react-router-dom";

export const LoginForm = (props: LoginFormProps) => {
  const { redirectTo, className } = props;
  const [loading, setLoading] = useSafeSetState(false);
  const login = useLogin();
  const translate = useTranslate();
  const notify = useNotify();
  const navigate = useNavigate();

  const submit = (values: FormData) => {
    setLoading(true);
    return login(values, redirectTo)
      .then((data) => {
        setLoading(false);
        return data;
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

  const signupRedirect = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  return (
      <Paper>
        <StyledForm
          onSubmit={submit}
          mode="onChange"
          noValidate
          className={className}
        >
          <CardContent className={LoginFormClasses.content}>
            <TextInput
              autoFocus
              source="username"
              label={translate("ra.auth.username")}
              autoComplete="username"
              validate={required()}
              fullWidth
            />
            <TextInput
              source="password"
              label={translate("ra.auth.password")}
              type="password"
              autoComplete="current-password"
              validate={required()}
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
                translate("ra.auth.sign_in")
              )}
            </Button>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              disabled={loading}
              fullWidth
              onClick={signupRedirect}
              className={LoginFormClasses.button}
            >
              {loading ? (
                <CircularProgress
                  className={LoginFormClasses.icon}
                  size={19}
                  thickness={3}
                />
              ) : (
                "Signup"
              )}
            </Button>
          </CardContent>
        </StyledForm>
      </Paper>
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

interface FormData extends Record<string, any> {
  username?: string;
  password?: string;
}
LoginForm.propTypes = {
  redirectTo: PropTypes.string,
};
