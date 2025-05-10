# frozen_string_literal: true

module ImageProcessingContext
  class AttachAvatarCommand < BaseCommand
    include Deps[
      imgproxy_client: 'api.imgproxy.client'
    ]

    use_contract do
      config.messages.namespace = :image_processing

      params do
        required(:character).filled(type?: Character)
        required(:params).hash do
          optional(:url).filled(:string)
        end
      end
    end

    private

    def do_persist(input)
      Tempfile.open('temp_avatar', encoding: 'ascii-8bit') do |file|
        file.write(
          imgproxy_client.process_image(
            processing_options: %w[resize:fill:200:200 gravity:sm format:jpg],
            url: input.dig(:params, :url),
            extension: 'jpg'
          )
        )
        file.rewind

        input[:character].avatar.attach(
          io: file,
          filename: 'avatar.jpg',
          key: "avatars/avatar-#{input[:character].id}-#{SecureRandom.alphanumeric(10)}.jpg",
          identify: false
        )
      end
    rescue Faraday::ConnectionFailed => _e
      nil
    end
  end
end
