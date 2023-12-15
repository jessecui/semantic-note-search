"use client";

import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  PasswordInput,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Session } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import supabaseClient from "../../../supabase/supabaseClient";
import Logo from "../../components/logo/logo";

export default function UpdatePassword() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      password: "",
    },

    validate: {
      password: (value: string) =>
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(value)
          ? null
          : "Password must be at least 8 characters long and include uppercase, lowercase, and a number",
    },
  });
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {    
    const fetchSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) console.log(error);
      else setSession(data.session);
      if (!data.session) {
        router.push("/");
      }
    };
    fetchSession();
  }, [router]);

  return (
    <main>
      <Container>
        <Flex justify="space-between" align="center" mih={60}>
          <Link href="/" style={{ display: "flex" }}>
          <Logo />
          </Link>
        </Flex>
        <Box maw={340} mx="auto">
          <Title size="1.5rem" mb={8} ta="center">
            Update Password
          </Title>
          <Text ta="center" my={16}>
            Please provide your new password below for the email{" "}
            <Text span fw="bold">
              {session?.user.email}
            </Text>
            .
          </Text>
          <form
            onSubmit={form.onSubmit(async (values) => {
              const { error } = await supabaseClient.auth.updateUser({
                password: values.password,
              });

              if (error === null) {
                router.push("/");
              } else {
                form.setErrors({
                  email: "There was a problem updating the password",
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
              <Button type="submit">Update Password</Button>
            </Center>
          </form>
        </Box>
      </Container>
    </main>
  );
}
