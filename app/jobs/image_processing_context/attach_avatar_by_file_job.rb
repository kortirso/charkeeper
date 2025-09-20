# frozen_string_literal: true

module ImageProcessingContext
  class AttachAvatarByFileJob < ApplicationJob
    queue_as :default

    def perform(character_id:, file:)
      character = Character.find_by(id: character_id)
      return unless character

      Charkeeper::Container.resolve('commands.image_processing.attach_avatar_by_file').call(
        character: character,
        file: file
      )
    end
  end
end
