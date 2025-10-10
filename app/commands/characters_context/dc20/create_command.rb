# frozen_string_literal: true

module CharactersContext
  module Dc20
    class CreateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :dc20_character

        Classes = Dry::Types['strict.string'].enum(*::Dc20::Character.classes_info.keys)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:main_class).filled(Classes)
          required(:ancestry_feats).hash
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
        end

        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)
      end

      private

      def do_prepare(input)
        input[:data] = build_fresh_character(input.slice(:main_class, :ancestry_feats).symbolize_keys)
      end

      def do_persist(input)
        character = ::Dc20::Character.create!(input.slice(:user, :name, :data))

        if input[:avatar_file]
          ImageProcessingContext::AttachAvatarByFileJob.perform_later(character_id: character.id, file: input[:avatar_file])
        end
        if input[:avatar_url]
          ImageProcessingContext::AttachAvatarByUrlJob.perform_later(character_id: character.id, url: input[:avatar_url])
        end

        { result: character }
      end

      def build_fresh_character(data)
        Dc20Character::BaseBuilder.new.call(result: data)
          .then { |result| Dc20Character::ClassBuilder.new.call(result: result) }
      end
    end
  end
end
