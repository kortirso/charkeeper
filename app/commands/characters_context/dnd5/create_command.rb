# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class CreateCommand < BaseCommand
      include Deps[
        refresh_feats: 'services.characters_context.dnd5.refresh_feats'
      ]

      use_contract do
        config.messages.namespace = :dnd5_character

        Races = Dry::Types['strict.string'].enum(*::Dnd5::Character.races.keys)
        Classes = Dry::Types['strict.string'].enum(*::Dnd5::Character.classes_info.keys)
        Alignments = Dry::Types['strict.string'].enum(*::Dnd5::Character::ALIGNMENTS)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:race).filled(Races)
          required(:main_class).filled(Classes)
          required(:alignment).filled(Alignments)
          optional(:subrace).filled(:string)
        end

        rule(:race, :subrace) do
          next if values[:subrace].nil?

          subraces = ::Dnd5::Character.subraces_info(values[:race]).keys
          next if subraces&.include?(values[:subrace])

          key(:subrace).failure(:invalid)
        end
      end

      private

      def do_prepare(input)
        input[:data] =
          build_fresh_character(input.slice(:race, :subrace, :main_class, :alignment).symbolize_keys)
      end

      def do_persist(input)
        character = ::Dnd5::Character.create!(input.slice(:user, :name, :data))
        refresh_feats.call(character: character)
        learn_spells_list(character, input)

        { result: character }
      end

      def build_fresh_character(data)
        Dnd5Character::BaseBuilder.new.call(result: data)
          .then { |result| Dnd5Character::RaceBuilder.new.call(result: result) }
          .then { |result| Dnd5Character::SubraceBuilder.new.call(result: result) }
          .then { |result| Dnd5Character::ClassBuilder.new.call(result: result) }
      end

      def learn_spells_list(character, input)
        return if ::Dnd5::Character::CLASSES_KNOW_SPELLS_LIST.exclude?(input[:main_class])

        spells = ::Dnd5::Spell.where('available_for && ?', "{#{input[:main_class]}}").map do |spell|
          {
            character_id: character.id,
            spell_id: spell.id,
            data: { ready_to_use: false, prepared_by: input[:main_class] }
          }
        end
        ::Character::Spell.upsert_all(spells) if spells.any?
      end
    end
  end
end
