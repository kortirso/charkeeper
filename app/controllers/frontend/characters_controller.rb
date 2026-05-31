# frozen_string_literal: true

module Frontend
  class CharactersController < Frontend::BaseController
    include SerializeResource

    DND_SERIALIZE_FIELDS = %i[id name level race subrace species legacy classes provider avatar].freeze
    DAGGERHEART_SERIALIZE_FIELDS = %i[id name level heritage heritage_name classes provider avatar names].freeze
    DC20_SERIALIZE_FIELDS = %i[id name level classes main_class ancestries provider avatar].freeze
    FATE_SERIALIZE_FIELDS = %i[id name provider avatar].freeze
    FALLOUT_SERIALIZE_FIELDS = %i[id name origin level provider avatar].freeze
    COSMERE_SERIALIZE_FIELDS = %i[id name level provider avatar].freeze

    before_action :find_character, only: %i[show destroy]
    before_action :set_current_provider, only: %i[show]
    before_action :set_locale, only: %i[show]

    def index
      render json: Panko::Response.new(
        characters: characters.flatten.sort_by { |item| item['name'] }
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
        set_current_provider(character_type)
        set_locale
        Panko::ArraySerializer.new(
          characters,
          each_serializer: serializer(character_type),
          only: serialize_fields(character_type),
          context: { simple: true }
        ).to_a
      end
    end

    def find_character
      @character = authorized_scope(Character.all).find(params.expect(:id))
    end

    def set_current_provider(character_type=nil)
      @current_provider =
        case character_type || @character.class.name
        when 'Daggerheart::Character' then 'daggerheart'
        end
    end

    def serializer(character_type)
      "#{character_type}Serializer".constantize
    end

    def serialize_fields(character_type)
      case character_type
      when 'Dnd5::Character', 'Dnd2024::Character', 'Pathfinder2::Character' then DND_SERIALIZE_FIELDS
      when 'Daggerheart::Character' then DAGGERHEART_SERIALIZE_FIELDS
      when 'Dc20::Character' then DC20_SERIALIZE_FIELDS
      when 'Fate::Character', 'Cthulhu7::Character' then FATE_SERIALIZE_FIELDS
      when 'Fallout::Character' then FALLOUT_SERIALIZE_FIELDS
      when 'Cosmere::Character' then COSMERE_SERIALIZE_FIELDS
      end
    end
  end
end
