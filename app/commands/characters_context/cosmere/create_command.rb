# frozen_string_literal: true

module CharactersContext
  module Cosmere
    class CreateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :cosmere_character

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:ancestry).filled(:string)
          required(:cultures).filled(:array, max_size?: 2).each(:string)
          optional(:skip_guide).filled(:bool)
        end
      end

      private

      def do_prepare(input)
        input[:data] = build_fresh_character(input.slice(:ancestry, :cultures, :skip_guide).symbolize_keys)
      end

      def do_persist(input)
        character = ::Cosmere::Character.create!(input.slice(:user, :name, :data))

        { result: character }
      end

      def build_fresh_character(data)
        CosmereCharacter::BaseBuilder.new.call(result: data)
      end
    end
  end
end
