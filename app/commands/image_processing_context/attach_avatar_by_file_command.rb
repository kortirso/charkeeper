# frozen_string_literal: true

module ImageProcessingContext
  class AttachAvatarByFileCommand < BaseCommand
    include Deps[
      attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url'
    ]

    FILE_SIZE_LIMIT = 1_500_000

    use_contract do
      config.messages.namespace = :image_processing

      params do
        required(:character).filled(type?: Character)
        required(:file).hash do
          required(:file_content).filled(:string)
          required(:file_name).filled(:string)
        end
      end
    end

    private

    # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    def do_persist(input)
      return if input.dig(:file, :file_content).size > FILE_SIZE_LIMIT

      Tempfile.open('temp_avatar_from_file', encoding: 'ascii-8bit') do |file|
        file_context = Base64.decode64(input.dig(:file, :file_content))

        if file_context
          file.write(file_context)
          file.rewind

          input[:character].temp_avatar.attach(
            io: file,
            filename: input.dig(:file, :file_name),
            key: "temp_avatars/avatar-#{input[:character].id}-#{SecureRandom.alphanumeric(10)}.#{extension(input)}",
            identify: false
          )
        end
      end
    rescue Faraday::ConnectionFailed => _e
      nil
    ensure
      if input[:character].temp_avatar.attached?
        attach_avatar_by_url.call({
          character: input[:character],
          url: input[:character].temp_avatar.blob.url
        })
      end
    end
    # rubocop: enable Metrics/AbcSize, Metrics/MethodLength

    def extension(input)
      input.dig(:file, :file_name).split('.')[-1]
    end
  end
end
