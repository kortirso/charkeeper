# frozen_string_literal: true

module ImageProcessingContext
  class AttachAvatarByUrlJob < ApplicationJob
    queue_as :default

    def perform(character_id:, url:)
      character = Character.find_by(id: character_id)
      return unless character

      Charkeeper::Container.resolve('commands.image_processing.attach_avatar_by_url').call(
        character: character,
        url: url
      )
    end
  end
end
