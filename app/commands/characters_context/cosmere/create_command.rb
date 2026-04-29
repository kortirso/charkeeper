# frozen_string_literal: true

module CharactersContext
  module Cosmere
    class CreateCommand < BaseCommand
      include Deps[
        add_feat: 'commands.characters_context.cosmere.feats.add'
      ]

      use_contract do
        config.messages.namespace = :cosmere_character

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:ancestry).filled(:string)
          required(:cultures).filled(:array, max_size?: 2).each(:string)
          optional(:path).filled(:string)
          optional(:skip_guide).filled(:bool)
        end
      end

      private

      def do_prepare(input)
        input[:data] = build_fresh_character(input.slice(:ancestry, :cultures, :path, :skip_guide).symbolize_keys)
        input[:initial_talent] = input[:data].delete(:initial_talent)
      end

      def do_persist(input)
        character = ::Cosmere::Character.create!(input.slice(:user, :name, :data))
        add_initial_talent(character, input)

        { result: character }
      end

      def build_fresh_character(data)
        CosmereCharacter::BaseBuilder.new.call(result: data)
          .then { |result| CosmereCharacter::PathBuilder.new.call(result: result) }
      end

      def add_initial_talent(character, input)
        feat = ::Cosmere::Feat.find_by(slug: input[:initial_talent])
        return unless feat

        add_feat.call(character: character, feat: feat)
      end
    end
  end
end
