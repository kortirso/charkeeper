# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class CreateCommand < BaseCommand
      include Deps[
        base_decorator: 'decorators.dnd2024_character.base_decorator',
        species_decorator: 'decorators.dnd2024_character.species_wrapper',
        class_decorator: 'decorators.dnd2024_character.class_wrapper'
      ]

      use_contract do
        config.messages.namespace = :dnd5_character

        Species = Dry::Types['strict.string'].enum(*::Dnd2024::Character::SPECIES)
        Classes = Dry::Types['strict.string'].enum(*::Dnd2024::Character::CLASSES)
        Alignments = Dry::Types['strict.string'].enum(*::Dnd2024::Character::ALIGNMENTS)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string)
          required(:species).filled(Species)
          required(:size).filled(:string)
          required(:main_class).filled(Classes)
          required(:alignment).filled(Alignments)
        end

        rule(:species, :size) do
          next if values[:species].nil?

          species_sizes = ::Dnd2024::Character::SIZES[values[:species]]
          next if species_sizes&.include?(values[:size])

          key(:size).failure(:invalid)
        end
      end

      private

      def do_prepare(input)
        input[:data] =
          decorate_fresh_character(input.slice(:species, :size, :main_class, :alignment).symbolize_keys)
      end

      def do_persist(input)
        character = ::Dnd2024::Character.create!(input.slice(:user, :name, :data))

        { result: character }
      end

      def decorate_fresh_character(data)
        base_decorator.decorate_fresh_character(**data)
          .then { |result| species_decorator.decorate_fresh_character(result: result) }
          .then { |result| class_decorator.decorate_fresh_character(result: result) }
      end
    end
  end
end
