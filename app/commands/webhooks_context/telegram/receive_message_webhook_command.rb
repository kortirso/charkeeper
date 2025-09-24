# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class ReceiveMessageWebhookCommand < BaseCommand
      use_contract do
        params do
          required(:message).hash do
            required(:message_id).filled(:integer)
            required(:from).hash do
              optional(:id).filled(:integer)
              optional(:first_name).filled(:string)
              optional(:last_name).filled(:string)
              optional(:username).filled(:string)
              optional(:language_code).filled(:string)
            end
            required(:chat).hash do
              required(:id).filled(:integer)
            end
            required(:text).filled(:string)
          end
        end

        rule(:message) do
          next if value[:text].starts_with?('/')

          key.failure(:not_command)
        end
      end

      private

      def do_persist(input)
        BotContext::HandleJob.perform_later(params: input)
        { result: :ok }
      end
    end
  end
end
