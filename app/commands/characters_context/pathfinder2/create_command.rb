# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    class CreateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :pathfinder2_character

        Races = Dry::Types['strict.string'].enum(*::Pathfinder2::Character.races.keys)
        Backgrounds = Dry::Types['strict.string'].enum(*::Pathfinder2::Character.backgrounds.keys)
        Classes = Dry::Types['strict.string'].enum(*::Pathfinder2::Character.classes_info.keys)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string)
          required(:race).filled(Races)
          required(:background).filled(Backgrounds)
          required(:main_class).filled(Classes)
          optional(:subrace).filled(:string)
          optional(:subclass).filled(:string)
          optional(:main_ability).filled(:string)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
        end

        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)

        rule(:race, :subrace) do
          next if values[:subrace].nil?

          subraces = ::Pathfinder2::Character.subraces(values[:race]).keys
          next if subraces&.include?(values[:subrace])

          key(:subrace).failure(:invalid)
        end

        rule(:main_class, :subclass) do
          next if values[:subclass].nil?

          subclasses = ::Pathfinder2::Character.subclasses_info(values[:main_class]).keys
          next if subclasses&.include?(values[:subclass])

          key(:subclass).failure(:invalid)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_prepare(input)
        input[:data] =
          build_fresh_character(
            input.slice(:race, :subrace, :background, :main_class, :subclass, :main_ability).symbolize_keys
          )
      end

      def do_persist(input)
        character = ::Pathfinder2::Character.create!(input.slice(:user, :name, :data))

        attach_avatar_by_file.call({ character: character, file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: character, url: input[:avatar_url] }) if input[:avatar_url]

        { result: character }
      end

      def build_fresh_character(data)
        Pathfinder2Character::BaseBuilder.new.call(result: data)
          .then { |result| Pathfinder2Character::RaceBuilder.new.call(result: result) }
          .then { |result| Pathfinder2Character::BackgroundBuilder.new.call(result: result) }
          .then { |result| Pathfinder2Character::ClassBuilder.new.call(result: result) }
          .then { |result| Pathfinder2Character::SubclassBuilder.new.call(result: result) }
      end
    end
  end
end
