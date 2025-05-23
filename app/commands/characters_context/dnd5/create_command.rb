# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class CreateCommand < BaseCommand
      include Deps[
        base_builder: 'builders.dnd5_character.base',
        race_builder: 'builders.dnd5_character.race',
        subrace_builder: 'builders.dnd5_character.subrace',
        class_builder: 'builders.dnd5_character.class',
        attach_avatar: 'commands.image_processing.attach_avatar'
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
          optional(:avatar_params).hash do
            optional(:url).filled(:string)
          end
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
          build_fresh_character(input.slice(:race, :subrace, :main_class, :alignment).symbolize_keys)
      end

      def do_persist(input)
        character = ::Dnd5::Character.create!(input.slice(:user, :name, :data))

        learn_spells_list(character, input)
        attach_avatar.call({ character: character, params: input[:avatar_params] }) if input[:avatar_params]

        { result: character }
      end

      def build_fresh_character(data)
        base_builder.call(result: data)
          .then { |result| race_builder.call(result: result) }
          .then { |result| subrace_builder.call(result: result) }
          .then { |result| class_builder.call(result: result) }
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
