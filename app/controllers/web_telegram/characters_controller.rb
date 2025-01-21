# frozen_string_literal: true

module WebTelegram
  class CharactersController < WebTelegram::BaseController
    include SerializeResource

    before_action :find_user_character, only: %i[show]

    INDEX_SERIALIZE_FIELDS = %i[object_data provider user_character_id].freeze

    def index
      render json: Panko::Response.new(
        characters: characters.flatten
      ), status: :ok
    end

    def show
      render json: serialize_resource(
        @user_character.characterable,
        show_serializer,
        :character,
        only: %i[object_data decorated_data provider user_character_id]
      ), status: :ok
    end

    private

    def characters
      characters_by_provider.map do |character_class, ids|
        Panko::ArraySerializer.new(
          relation(character_class).where(id: ids.pluck(:characterable_id)),
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
      when 'Dnd5::Character' then Dnd5::Character
      end
    end

    def index_serializer(character_class)
      case character_class
      when 'Dnd5::Character' then Dnd5::CharacterSerializer
      end
    end

    def find_user_character
      @user_character = current_user.user_characters.find_by(id: params[:id])
    end

    def show_serializer
      case @user_character.provider
      when ::User::Character::DND5 then Dnd5::CharacterSerializer
      end
    end
  end
end
