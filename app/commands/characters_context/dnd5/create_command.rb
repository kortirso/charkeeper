# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class CreateCommand < BaseCommand
      include Deps[
        base_decorator: 'decorators.dnd5_character.base_decorator',
        race_decorator: 'decorators.dnd5_character.race_wrapper',
        subrace_decorator: 'decorators.dnd5_character.subrace_wrapper',
        class_decorator: 'decorators.dnd5_character.class_wrapper'
      ]

      use_contract do
        config.messages.namespace = :dnd5_character

        Races = Dry::Types['strict.string'].enum(*::Dnd5::Character::RACES)
        Classes = Dry::Types['strict.string'].enum(*::Dnd5::Character::CLASSES)
        Alignments = Dry::Types['strict.string'].enum(*::Dnd5::Character::ALIGNMENTS)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string)
          required(:race).filled(Races)
          required(:main_class).filled(Classes)
          required(:alignment).filled(Alignments)
          optional(:subrace).filled(:string)
        end

        rule(:race, :subrace) do
          next if values[:subrace].nil?

          subraces = ::Dnd5::Character::SUBRACES[values[:race]]
          next if subraces&.include?(values[:subrace])

          key(:subrace).failure(:invalid)
        end
      end

      private

      def do_prepare(input)
        input[:data] =
          decorate_fresh_character(input.slice(:race, :subrace, :main_class, :alignment).symbolize_keys)
      end

      def do_persist(input)
        character = ::Dnd5::Character.create!(input.slice(:user, :name, :data))

        learn_spells_list(character, input)

        { result: character }
      end

      def decorate_fresh_character(data)
        base_decorator.decorate_fresh_character(**data)
          .then { |result| race_decorator.decorate_fresh_character(result: result) }
          .then { |result| subrace_decorator.decorate_fresh_character(result: result) }
          .then { |result| class_decorator.decorate_fresh_character(result: result) }
      end

      def learn_spells_list(character, input)
        return if ::Dnd5::Character::CLASSES_KNOW_SPELLS_LIST.exclude?(input[:main_class])

        spells = ::Dnd5::Spell.all.filter_map do |spell|
          next if spell.data.available_for.exclude?(input[:main_class])

          {
            character_id: character.id,
            spell_id: spell.id,
            data: { ready_to_use: false, prepared_by: input[:main_class] }
          }
        end

        ::Character::Spell.upsert_all(spells)
      end
    end
  end
end
