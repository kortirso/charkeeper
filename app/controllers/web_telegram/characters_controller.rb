# frozen_string_literal: true

module WebTelegram
  class CharactersController < WebTelegram::BaseController
    include SerializeResource

    INDEX_SERIALIZE_FIELDS = %i[id name object_data provider].freeze
    SHOW_SERIALIZE_FIELDS = %i[id name object_data decorated_data provider].freeze

    before_action :find_character, only: %i[show destroy]

    def index
      render json: Panko::Response.new(
        characters: characters.flatten
      ), status: :ok
    end

    def show
      render json: serialize_resource(
        @character,
        serializer(@character.type),
        :character,
        only: SHOW_SERIALIZE_FIELDS
      ), status: :ok
    end

    def destroy
      @character.destroy
      render json: { result: :ok }, status: :ok
    end

    private

    def characters
      characters_by_provider.map do |character_type, ids|
        Panko::ArraySerializer.new(
          relation(character_type).where(id: ids.pluck(:id)),
          each_serializer: serializer(character_type),
          only: INDEX_SERIALIZE_FIELDS
        ).to_a
      end
    end

    def characters_by_provider
      current_user
        .characters
        .hashable_pluck(:id, :type)
        .group_by { |item| item[:type] }
    end

    def relation(character_type)
      case character_type
      when 'Dnd5::Character' then ::Dnd5::Character
      when 'Dnd2024::Character' then ::Dnd2024::Character
      when 'Pathfinder2::Character' then ::Pathfinder2::Character
      when 'Daggerheart::Character' then ::Daggerheart::Character
      end
    end

    def find_character
      @character = current_user.characters.find(params[:id])
    end

    def serializer(character_type)
      case character_type
      when 'Dnd5::Character' then ::Dnd5::CharacterSerializer
      when 'Dnd2024::Character' then ::Dnd2024::CharacterSerializer
      when 'Pathfinder2::Character' then ::Pathfinder2::CharacterSerializer
      when 'Daggerheart::Character' then ::Daggerheart::CharacterSerializer
      end
    end
  end
end
