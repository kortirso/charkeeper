# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class CreateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file',
        refresh_feats: 'services.characters_context.daggerheart.refresh_feats'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :daggerheart_character

        Communities = Dry::Types['strict.string'].enum(*::Daggerheart::Character.communities.keys)
        # Classes = Dry::Types['strict.string'].enum(*::Daggerheart::Character.classes_info.keys)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string)
          required(:community).filled(Communities)
          required(:main_class).filled(:string)
          required(:subclass).filled(:string)
          optional(:heritage).filled(:string)
          optional(:heritage_name).filled(:string)
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
          next if values[:heritage].in?(::Daggerheart::Homebrew::Race.where(user_id: values[:user].id).ids)

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

        attach_avatar_by_file.call({ character: character, file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: character, url: input[:avatar_url] }) if input[:avatar_url]
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
