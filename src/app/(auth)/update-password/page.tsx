"use client";

import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Session, createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  const url = "https://faozpgzgwapvpomsfuig.supabase.co";
  const publicKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb3pwZ3pnd2FwdnBvbXNmdWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwOTE1NTQsImV4cCI6MjAxNTY2NzU1NH0.3JTgWckpK194wc3hht_KnWev_Rqe4C8Mdpg9ALM0JKo";

  useEffect(() => {
    const supabaseClient = createClient(url, publicKey);

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
              const supabase = createClient(url, publicKey);

              const { data, error } = await supabase.auth.updateUser({
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
