# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class CreateCommand < BaseCommand
      include Deps[
        base_decorator: 'decorators.daggerheart_character.base_decorator',
        heritage_decorator: 'decorators.daggerheart_character.heritage_wrapper',
        class_decorator: 'decorators.daggerheart_character.class_wrapper',
        attach_avatar: 'commands.image_processing.attach_avatar'
      ]

      use_contract do
        config.messages.namespace = :daggerheart_character

        Heritages = Dry::Types['strict.string'].enum(*::Daggerheart::Character::HERITAGES)
        Classes = Dry::Types['strict.string'].enum(*::Daggerheart::Character::CLASSES)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string)
          required(:heritage).filled(Heritages)
          required(:main_class).filled(Classes)
          optional(:avatar_params).hash do
            optional(:url).filled(:string)
          end
        end
      end

      private

      def do_prepare(input)
        input[:data] =
          decorate_fresh_character(input.slice(:heritage, :main_class).symbolize_keys)
      end

      def do_persist(input)
        character = ::Daggerheart::Character.create!(input.slice(:user, :name, :data))

        attach_avatar.call({ character: character, params: input[:avatar_params] }) if input[:avatar_params]

        { result: character }
      end

      def decorate_fresh_character(data)
        base_decorator.decorate_fresh_character(**data)
          .then { |result| heritage_decorator.decorate_fresh_character(result: result) }
          .then { |result| class_decorator.decorate_fresh_character(result: result) }
      end
    end
  end
end
