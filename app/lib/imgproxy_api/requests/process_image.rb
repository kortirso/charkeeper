# frozen_string_literal: true

require 'base64'
require 'openssl'

module ImgproxyApi
  module Requests
    module ProcessImage
      def process_image(url:, extension:, processing_options: [])
        process_url = "/#{processing_options.join('/')}/#{Base64.urlsafe_encode64(url, padding: false)}.#{extension}"
        digest = credentials.nil? ? 'unsafe' : generate_digest(process_url)
        get(path: "#{digest}#{process_url}")[:body]
      end

      private

      def generate_digest(process_url)
        Base64.urlsafe_encode64(
          OpenSSL::HMAC.digest('sha256', credentials.secret, "#{credentials.salt}#{process_url}"),
          padding: false
        )
      end

      def credentials
        Rails.application.credentials.dig(Rails.env.to_sym, :imgproxy)
      end
    end
  end
end
