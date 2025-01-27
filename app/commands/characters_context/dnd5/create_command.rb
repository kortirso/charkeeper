# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class CreateCommand < BaseCommand
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
        end
      end

      private

      def do_prepare(input)
        input[:classes] = { input[:main_class] => 1 }
        input[:subclasses] = { input[:main_class] => nil }
        input[:health] = 8 # class based
        input[:speed] = 30 # race based
        input[:languages] = [] # race/class based
        input[:weapon_core_skills] = [] # race/class based
        input[:weapon_skills] = [] # race/class based
        input[:armor_proficiency] = [] # race/class based
      end

      def do_persist(input)
        character = input[:user].characters.dnd5.build
        character.name = input[:name]
        character.data = input.except(:user, :name)
        character.save!

        { result: character }
      end
    end
  end
end
