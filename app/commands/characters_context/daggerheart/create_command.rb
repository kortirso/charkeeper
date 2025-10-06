# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class CreateCommand < BaseCommand
      include Deps[
        refresh_feats: 'services.characters_context.daggerheart.refresh_feats'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :daggerheart_character

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:community).filled(:string)
          required(:main_class).filled(:string)
          required(:subclass).filled(:string)
          optional(:heritage).filled(:string)
          optional(:heritage_name).filled(:string, max_size?: 50)
          optional(:heritage_features).filled(:array).each(:string)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
        end

        rule(:heritage, :heritage_name).validate(:check_at_least_one_present)
        rule(:heritage, :heritage_name).validate(:check_only_one_present)
        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)

        rule(:heritage, :user) do
          next if values[:heritage].blank?
          next if values[:heritage].in?(::Daggerheart::Character.heritages.keys)

          user_homebrew = values[:user].user_homebrew
          next if user_homebrew && values[:heritage].in?(user_homebrew.data.dig('daggerheart', 'races').keys)

          key.failure(:included_in?)
        end

        rule(:community, :user) do
          next if values[:community].blank?
          next if values[:community].in?(::Daggerheart::Character.communities.keys)

          user_homebrew = values[:user].user_homebrew
          next if user_homebrew && values[:community].in?(user_homebrew.data.dig('daggerheart', 'communities').keys)

          key.failure(:included_in?)
        end

        # TODO: проверять, что класс стандартный или homebrew
        # TODO: проверять, что подкласс существует и принадлежит классу
        # rule(:main_class, :subclass) do
        #   next if values[:subclass].nil?

        #   subclasses = ::Daggerheart::Character.subclasses_info(values[:main_class]).keys
        #   next if subclasses&.include?(values[:subclass])

        #   key(:subclass).failure(:invalid)
        # end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_prepare(input)
        input[:data] =
          decorate_fresh_character(
            input.slice(:heritage, :heritage_name, :heritage_features, :community, :main_class, :subclass).symbolize_keys
          )
      end

      def do_persist(input)
        character = ::Daggerheart::Character.create!(input.slice(:user, :name, :data))
        refresh_feats.call(character: character)

        if input[:avatar_file]
          ImageProcessingContext::AttachAvatarByFileJob.perform_later(character_id: character.id, file: input[:avatar_file])
        end
        if input[:avatar_url]
          ImageProcessingContext::AttachAvatarByUrlJob.perform_later(character_id: character.id, url: input[:avatar_url])
        end

        add_starting_equipment(character)

        { result: character }
      end

      def decorate_fresh_character(data)
        DaggerheartCharacter::BaseBuilder.new.call(result: data)
          .then { |result| DaggerheartCharacter::ClassBuilder.new.call(result: result) }
      end

      def add_starting_equipment(character)
        DaggerheartCharacter::ClassBuilder.new.equip(character: character)
      end
    end
  end
end
