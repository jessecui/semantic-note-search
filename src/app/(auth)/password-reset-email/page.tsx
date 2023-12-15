"use client";

import { Box, Container, Flex, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import supabaseClient from "../../../supabase/supabaseClient";
import Logo from "../../components/logo/logo";

export default function PasswordResetEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const router = useRouter();

  // Redirect user if already logged in
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
        <Box maw={500} mx="auto">
          <Title size="1.5rem" mb={16} ta="center">
            Password Reset Email Sent
          </Title>
          <Stack>
            <Text ta="center">
              A password reset email has been sent to{" "}
              <Text span fw="bold">
                {email}
              </Text>{" "}
              if an account exists for it. Please click the link in the email to
              reset your password.
            </Text>
            <Text ta="center">
              If an email has not been received within 5 minutes, please try
              filling out the password reset form again or double checking the
              email you provided.
            </Text>
          </Stack>
        </Box>
      </Container>
    </main>
  );
}
