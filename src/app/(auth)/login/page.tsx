"use client";

import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LogIn() {
  const router = useRouter();

  const logInUser = async (email: string, password: string) => {
    const url = "https://faozpgzgwapvpomsfuig.supabase.co";
    const publicKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb3pwZ3pnd2FwdnBvbXNmdWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwOTE1NTQsImV4cCI6MjAxNTY2NzU1NH0.3JTgWckpK194wc3hht_KnWev_Rqe4C8Mdpg9ALM0JKo";

    const supabase = createClient(url, publicKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error)
      form.setErrors({
        email: " ",
        password: "Email and password not found for the account",
      });
    else router.push("/dashboard");
  };

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email",
      password: (value: string) =>
        value.length > 7 ? null : "Password is too short",
    },
  });

  return (
    <main>
      <Container>
        <Flex justify="space-between" align="center" mih={60}>
          <Link href="/" style={{ display: "flex" }}>
            <Image
              src="/crux-logo.png"
              alt="Crux Logo"
              width={90}
              height={30}
              priority
            />
          </Link>
        </Flex>
        <Box maw={340} mx="auto">
          <Title size="1.5rem" mb={8} ta="center">
            Log In
          </Title>
          <form
            onSubmit={form.onSubmit((values) =>
              logInUser(values.email, values.password),
            )}
          >
            <TextInput
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps("email")}
            />
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
          <Divider my={16} />
          <Box ta="center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#0395FF" }}>
              Sign Up
            </Link>
            <Text ta="center" mt={8}>
              Forgot your password?{" "}
              <Link href="/reset-password" style={{ color: "#0395FF" }}>
                Reset Password
              </Link>
            </Text>
          </Box>
        </Box>
      </Container>
    </main>
  );
}
