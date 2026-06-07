# frozen_string_literal: true

module CharactersContext
  module Cthulhu7
    class UpdateCommand < BaseCommand
      include Deps[
        cache: 'cache.avatars'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :cthulhu7_character

        params do
          required(:character).filled(type?: ::Cthulhu7::Character)
          optional(:abilities).hash do
            required(:str).filled(:integer, gteq?: 1, lteq?: 100)
            required(:con).filled(:integer, gteq?: 1, lteq?: 100)
            required(:siz).filled(:integer, gteq?: 1, lteq?: 100)
            required(:dex).filled(:integer, gteq?: 1, lteq?: 100)
            required(:app).filled(:integer, gteq?: 1, lteq?: 100)
            required(:int).filled(:integer, gteq?: 1, lteq?: 100)
            required(:pow).filled(:integer, gteq?: 1, lteq?: 100)
            required(:edu).filled(:integer, gteq?: 1, lteq?: 100)
          end
          optional(:name).filled(:string, max_size?: 50)
          optional(:file)
          optional(:guide_step).maybe(:integer)
          optional(:selected_skills).hash
          optional(:additional_skills).hash
          optional(:improved_skills).maybe(:array)
          optional(:hidden_skills).maybe(:array)
          optional(:health).maybe(:integer, gteq?: 0)
          optional(:magic).maybe(:integer, gteq?: 0)
          optional(:sanity).maybe(:integer, gteq?: 0)
          optional(:luck_max).maybe(:integer, gteq?: 0)
          optional(:luck).maybe(:integer, gteq?: 0)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def lock_key(input) = "character_update_#{input[:character].id}"
      def lock_time = 0

      def do_prepare(input) # rubocop: disable Metrics/AbcSize
        %i[abilities].each do |key|
          input[key]&.transform_values!(&:to_i)
        end

        if input.key?(:abilities) && input[:character].data.selected_skills.empty?
          input[:selected_skills] = { dodge: input.dig(:abilities, :dex) / 2, language: input.dig(:abilities, :edu) }
          input[:health] = (input.dig(:abilities, :con) + input.dig(:abilities, :siz)) / 10
          input[:magic] = input.dig(:abilities, :pow) / 5
          input[:sanity] = input.dig(:abilities, :pow)
        end
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character, :file, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        upload_avatar(input)

        { result: input[:character] }
      end

      def upload_avatar(input)
        return unless input.key?(:file)

        input[:character].avatar.attach(input[:file])
        cache.push_item(item: input[:character].avatar)
      rescue StandardError => _e
      end
    end
  end
end
