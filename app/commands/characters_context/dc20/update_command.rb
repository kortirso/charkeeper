# frozen_string_literal: true

module CharactersContext
  module Dc20
    class UpdateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :dc20_character

        params do
          required(:character).filled(type?: ::Dc20::Character)
          optional(:attributes).hash do
            required(:mig).filled(:integer)
            required(:agi).filled(:integer)
            required(:int).filled(:integer)
            required(:cha).filled(:integer)
          end
          optional(:health).hash do
            required(:current).filled(:integer)
            required(:temp).filled(:integer)
          end
          optional(:combat_masteries).value(:array).each(included_in?: ::Dc20::Character.combat_masteries.keys)
          optional(:name).filled(:string, max_size?: 50)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
        end

        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)

        rule(:attributes) do
          next if value.nil?
          next if value.values.all? { |item| item.positive? && item <= 7 }

          key.failure(:invalid_value)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_persist(input)
        input[:character].data =
          input[:character].data.attributes.merge(input.except(:character, :avatar_file, :avatar_url, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        attach_avatar_by_file.call({ character: input[:character], file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: input[:character], url: input[:avatar_url] }) if input[:avatar_url]

        { result: input[:character] }
      end
    end
  end
end
