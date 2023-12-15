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

const signUpUser = async (email: string, password: string) => {
  const url = "https://faozpgzgwapvpomsfuig.supabase.co";
  const publicKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb3pwZ3pnd2FwdnBvbXNmdWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwOTE1NTQsImV4cCI6MjAxNTY2NzU1NH0.3JTgWckpK194wc3hht_KnWev_Rqe4C8Mdpg9ALM0JKo";

  const supabase = createClient(url, publicKey);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "http://localhost:3000/",
    },
  });

  return error;
};

export default function SignUp() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value: string) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? null
          : "Invalid email",
      password: (value: string) =>
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(value)
          ? null
          : "Password must be at least 8 characters long and include uppercase, lowercase, and a number",
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
            Sign Up
          </Title>
          <form
            onSubmit={form.onSubmit(async (values) => {
              const responseError = await signUpUser(
                values.email,
                values.password,
              );
              if (responseError === null) {                
                router.push(
                  `/verify-email?email=${encodeURIComponent(values.email)}`,
                );
              } else {
                form.setErrors({
                  email: "There was a problem setting up your account",
                });
              }
            })}
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
              <Button type="submit">Create Account</Button>
            </Center>
          </form>
          <Divider my={16} />
          <Text ta="center">
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#0395FF" }}>
              Log In
            </Link>
          </Text>
        </Box>
      </Container>
    </main>
  );
}
