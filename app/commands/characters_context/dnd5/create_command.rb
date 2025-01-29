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
        input[:classes] = { input[:main_class] => 1 }
        input[:subclasses] = { input[:main_class] => nil }

        base_decorator = Dnd5NewCharacter::BaseDecorator.new(**input.slice(:race, :subrace, :main_class).symbolize_keys)
        race_decorator = Dnd5NewCharacter::RaceDecorator.new(decorator: base_decorator)
        subrace_decorator = Dnd5NewCharacter::SubraceDecorator.new(decorator: race_decorator)
        decorator = Dnd5NewCharacter::ClassDecorator.new(decorator: subrace_decorator)

        input.merge!(decorator.decorate)
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
