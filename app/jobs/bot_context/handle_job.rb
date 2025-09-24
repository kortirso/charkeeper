# frozen_string_literal: true

module BotContext
  class HandleJob < ApplicationJob
    queue_as :default

    def perform(params:)
      define_locale(params[:message])

      Charkeeper::Container.resolve('services.bot_context.handle').call(
        source: params.dig(:message, :chat, :id).positive? ? :telegram_bot : :telegram_group_bot,
        message: params[:message][:text],
        data: { raw_message: params[:message], user: identity(params[:message])&.user }.compact
      )
    end

    private

    def define_locale(message)
      message_locale = message.dig(:from, :language_code)&.to_sym || :en
      I18n.locale = I18n.available_locales.include?(message_locale) ? message_locale : I18n.default_locale
    end

    def identity(message)
      User::Identity.find_by(provider: User::Identity::TELEGRAM, uid: message.dig(:chat, :id).to_s)
    end
  end
end
