# frozen_string_literal: true

require 'base64'

module ImgproxyApi
  module Requests
    module ProcessImage
      def process_image(url:, extension:, processing_options: [])
        get(
          path: "unsafe/#{processing_options.join('/')}/#{Base64.urlsafe_encode64(url, padding: false)}.#{extension}"
        )
      end
    end
  end
end
