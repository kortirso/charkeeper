# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    class CreateCommand < BaseCommand
      include Deps[
        base_decorator: 'decorators.pathfinder2_character.base_decorator',
        race_decorator: 'decorators.pathfinder2_character.race_wrapper',
        subrace_decorator: 'decorators.pathfinder2_character.subrace_wrapper',
        class_decorator: 'decorators.pathfinder2_character.class_wrapper',
        attach_avatar: 'commands.image_processing.attach_avatar'
      ]

      use_contract do
        config.messages.namespace = :pathfinder2_character

        Races = Dry::Types['strict.string'].enum(*::Pathfinder2::Character::RACES)
        Classes = Dry::Types['strict.string'].enum(*::Pathfinder2::Character::CLASSES)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string)
          required(:race).filled(Races)
          required(:main_class).filled(Classes)
          optional(:subrace).filled(:string)
          optional(:avatar_params).hash do
            optional(:url).filled(:string)
          end
        end

        rule(:race, :subrace) do
          next if values[:subrace].nil?

          subraces = ::Pathfinder2::Character::SUBRACES[values[:race]]
          next if subraces&.include?(values[:subrace])

          key(:subrace).failure(:invalid)
        end
      end

      private

      def do_prepare(input)
        input[:data] =
          decorate_fresh_character(input.slice(:race, :subrace, :main_class).symbolize_keys)
      end

      def do_persist(input)
        character = ::Pathfinder2::Character.create!(input.slice(:user, :name, :data))

        attach_avatar.call({ character: character, params: input[:avatar_params] }) if input[:avatar_params]

        { result: character }
      end

      def decorate_fresh_character(data)
        base_decorator.decorate_fresh_character(**data)
          .then { |result| race_decorator.decorate_fresh_character(result: result) }
          .then { |result| subrace_decorator.decorate_fresh_character(result: result) }
          .then { |result| class_decorator.decorate_fresh_character(result: result) }
      end
    end
  end
end
