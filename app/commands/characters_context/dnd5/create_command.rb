# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class CreateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file'
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
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
        end

        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)

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
        attach_avatar_by_file.call({ character: character, file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: character, url: input[:avatar_url] }) if input[:avatar_url]

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
