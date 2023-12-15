"use client";

import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import supabaseClient from "../../../supabase/supabaseClient";
import Logo from "../../components/logo/logo";

export default function ResetPassword() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: "",
    },

    validate: {
      email: (value: string) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? null
          : "Invalid email",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) console.log(error);
      if (data.session) {
        router.push("/");
      }
    };
    fetchUser();
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
            Reset Password
          </Title>
          <Text ta="center" my={16}>
            Please provide your account email address below and we will send a
            password reset link
          </Text>
          <form
            onSubmit={form.onSubmit(async (values) => {
              const url = "https://faozpgzgwapvpomsfuig.supabase.co";
              const publicKey =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb3pwZ3pnd2FwdnBvbXNmdWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwOTE1NTQsImV4cCI6MjAxNTY2NzU1NH0.3JTgWckpK194wc3hht_KnWev_Rqe4C8Mdpg9ALM0JKo";

              const supabase = createClient(url, publicKey);

              const { data, error } = await supabase.auth.resetPasswordForEmail(
                values.email,
                {
                  redirectTo: "http://localhost:3000/update-password",
                },
              );

              if (error === null) {
                router.push(
                  `/password-reset-email?email=${encodeURIComponent(
                    values.email,
                  )}`,
                );
              } else {
                form.setErrors({
                  email: "There was a problem sending a password reset email",
                });
              }
            })}
          >
            <TextInput
              placeholder="your@email.com"
              {...form.getInputProps("email")}
            />
            <Center mt={24}>
              <Button type="submit">Send Password Reset Email</Button>
            </Center>
          </form>
        </Box>
      </Container>
    </main>
  );
}
