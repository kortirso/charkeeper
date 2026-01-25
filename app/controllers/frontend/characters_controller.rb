# frozen_string_literal: true

module Frontend
  class CharactersController < Frontend::BaseController
    include SerializeResource

    DND_SERIALIZE_FIELDS = %i[id name level race subrace species legacy classes provider avatar].freeze
    DAGGERHEART_SERIALIZE_FIELDS = %i[id name level heritage heritage_name classes provider avatar names].freeze
    DC20_SERIALIZE_FIELDS = %i[id name level classes main_class ancestries provider avatar].freeze

    before_action :find_character, only: %i[show destroy]

    def index
      render json: Panko::Response.new(
        characters: characters.flatten.sort_by { |item| item['created_at'] }.reverse
      ), status: :ok
    end

    def show
      serialize_resource(@character, serializer(@character.type), :character, { except: %i[avatar] })
    end

    def destroy
      @character.destroy
      only_head_response
    end

    private

    def characters
      current_user.characters.group_by(&:type).map do |character_type, characters|
        Panko::ArraySerializer.new(
          characters,
          each_serializer: serializer(character_type),
          only: serialize_fields(character_type),
          context: { simple: true }
        ).to_a
      end
    end

    def find_character
      @character = authorized_scope(Character.all).find(params[:id])
    end

    def serializer(character_type)
      case character_type
      when 'Dnd5::Character' then ::Dnd5::CharacterSerializer
      when 'Dnd2024::Character' then ::Dnd2024::CharacterSerializer
      when 'Pathfinder2::Character' then ::Pathfinder2::CharacterSerializer
      when 'Daggerheart::Character' then ::Daggerheart::CharacterSerializer
      when 'Dc20::Character' then ::Dc20::CharacterSerializer
      end
    end

    def serialize_fields(character_type)
      case character_type
      when 'Dnd5::Character', 'Dnd2024::Character', 'Pathfinder2::Character' then DND_SERIALIZE_FIELDS
      when 'Daggerheart::Character' then DAGGERHEART_SERIALIZE_FIELDS
      when 'Dc20::Character' then DC20_SERIALIZE_FIELDS
      end
    end
  end
end
