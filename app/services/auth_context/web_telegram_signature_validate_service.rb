# frozen_string_literal: true

module AuthContext
  class WebTelegramSignatureValidateService
    BOT_TOKEN_SIGN_KEY = 'WebAppData'

    attr_reader :bot_token

    def initialize(bot_token: Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token))
      @bot_token = bot_token
    end

    def valid?(check_string:, hash:)
      OpenSSL::HMAC.hexdigest(
        digest,
        OpenSSL::HMAC.digest(digest, BOT_TOKEN_SIGN_KEY, bot_token),
        check_string
      ) == hash
    end

    private

    def digest
      @digest ||= OpenSSL::Digest.new('sha256')
    end
  end
end
