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
            processing_options: %w[rs:fill:200:200 g:sm],
            url: input.dig(:params, :url),
            extension: 'jpg'
          )
        )
        file.rewind

        input[:character].avatar.attach(
          io: file,
          filename: 'avatar.jpg',
          key: "avatars/avatar-#{SecureRandom.uuid}.jpg",
          identify: false
        )
      end
    end
  end
end
