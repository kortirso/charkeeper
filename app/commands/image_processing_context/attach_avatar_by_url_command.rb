# frozen_string_literal: true

module ImageProcessingContext
  class AttachAvatarByUrlCommand < BaseCommand
    include Deps[
      imgproxy_client: 'api.imgproxy.client'
    ]

    use_contract do
      config.messages.namespace = :image_processing

      params do
        required(:character).filled(type?: Character)
        required(:url).filled(:string)
      end
    end

    private

    # rubocop: disable Metrics/MethodLength
    def do_persist(input)
      Tempfile.open('avatar', encoding: 'ascii-8bit') do |file|
        file_context = imgproxy_client.process_image(
          processing_options: %w[resize:fill:128:128 gravity:sm quality:90 format:jpg],
          url: input[:url],
          extension: 'jpg'
        )

        if file_context
          file.write(file_context)
          file.rewind

          input[:character].avatar.attach(
            io: file,
            filename: 'avatar.jpg',
            key: "avatars/avatar-#{input[:character].id}-#{SecureRandom.alphanumeric(10)}.jpg",
            identify: false
          )
        end
      end
    rescue Faraday::ConnectionFailed => _e
      nil
    ensure
      input[:character].temp_avatar.purge if input[:character].temp_avatar.attached?
    end
    # rubocop: enable Metrics/MethodLength
  end
end
