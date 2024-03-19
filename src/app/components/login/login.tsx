"use client";

import { Button, Center, Modal, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";

export default function LogIn() {
  const [opened, { close }] = useDisclosure(true);
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      yOffset="15vh"
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 2,
      }}
      closeOnEscape={false}
      closeOnClickOutside={false}      
    >
      <form
        onSubmit={form.onSubmit(async ({ username, password }) => {
          const response = await fetch(
            `/verify-login?username=${encodeURIComponent(
              username,
            )}&password=${encodeURIComponent(password)}`,
          );
          const { verified } = await response.json();

          if (verified) {
            close();
          } else {
            form.setErrors({
              password: "Invalid password",
            });
          }
        })}
      >
        <PasswordInput
          label="Password"
          placeholder="********"
          {...form.getInputProps("password")}
          mt={8}
        />
        <Center mt={24}>
          <Button type="submit">Log In</Button>
        </Center>
      </form>
    </Modal>
  );
}
