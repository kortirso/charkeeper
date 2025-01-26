# frozen_string_literal: true

module WebTelegram
  class CharactersController < WebTelegram::BaseController
    include SerializeResource

    INDEX_SERIALIZE_FIELDS = %i[object_data provider user_character_id].freeze
    SHOW_SERIALIZE_FIELDS = %i[object_data decorated_data provider user_character_id].freeze

    before_action :find_character, only: %i[show]

    def index
      render json: Panko::Response.new(
        characters: characters.flatten
      ), status: :ok
    end

    def show
      render json: serialize_resource(
        @character,
        show_serializer,
        :character,
        only: SHOW_SERIALIZE_FIELDS
      ), status: :ok
    end

    private

    def characters
      characters_by_provider.map do |character_class, ids|
        Panko::ArraySerializer.new(
          relation(character_class).where(id: ids.pluck(:characterable_id)).includes(:user_character),
          each_serializer: index_serializer(character_class),
          only: INDEX_SERIALIZE_FIELDS
        ).to_a
      end
    end

    def characters_by_provider
      current_user
        .user_characters
        .hashable_pluck(:characterable_id, :characterable_type)
        .group_by { |item| item[:characterable_type] }
    end

    def relation(character_class)
      case character_class
      when 'Dnd5::Character' then ::Dnd5::Character
      end
    end

    def index_serializer(character_class)
      case character_class
      when 'Dnd5::Character' then ::Dnd5::CharacterSerializer
      end
    end

    def find_character
      @character =
        current_user
          .user_characters
          .find(params[:id])
          .characterable
    end

    def show_serializer
      case @character.user_character.provider
      when ::User::Character::DND5 then ::Dnd5::CharacterSerializer
      end
    end
  end
end
