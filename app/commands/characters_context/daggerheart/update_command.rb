# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class UpdateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file',
        refresh_feats: 'services.characters_context.daggerheart.refresh_feats'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :daggerheart_character

        Beastforms = Dry::Types['strict.string'].enum(*::Daggerheart::Character.beastforms.keys)

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          optional(:classes).hash
          optional(:domains).hash
          optional(:subclasses).hash
          optional(:subclasses_mastery).hash
          optional(:traits).hash do
            required(:str).filled(:integer)
            required(:agi).filled(:integer)
            required(:fin).filled(:integer)
            required(:ins).filled(:integer)
            required(:pre).filled(:integer)
            required(:know).filled(:integer)
          end
          optional(:spent_armor_slots).filled(:integer)
          optional(:health_marked).filled(:integer)
          optional(:stress_marked).filled(:integer)
          optional(:hope_marked).filled(:integer)
          optional(:gold).hash do
            required(:coins).filled(:integer) # TODO: если значение 10, то увеличивать на 1 нижестоящий
            required(:handfuls).filled(:integer)
            required(:bags).filled(:integer)
            required(:chests).filled(:integer)
          end
          optional(:energy).hash
          optional(:selected_features).hash
          optional(:leveling).hash do
            required(:health).filled(:integer)
            required(:stress).filled(:integer)
            required(:evasion).filled(:integer)
            required(:proficiency).filled(:integer)
            required(:domain_cards).filled(:integer)
          end
          optional(:name).filled(:string)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
          optional(:experience).maybe(:array).each(:hash) do
            required(:id).filled(:integer)
            required(:exp_name).filled(:string)
            required(:exp_level).filled(:integer)
          end
          optional(:beastform).maybe(Beastforms)
        end

        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)

        rule(:traits) do
          next if value.nil?
          next if value.values.all? { |item| item.between?(-5, 5) }

          key.failure(:invalid_value)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_prepare(input)
        input[:level] = input[:classes].values.sum(&:to_i) if input[:classes]
        %i[classes traits energy].each do |key|
          input[key]&.transform_values!(&:to_i)
        end
      end

      # rubocop: disable Metrics/AbcSize
      def do_persist(input)
        input[:character].data =
          input[:character].data.attributes.merge(input.except(:character, :avatar_file, :avatar_url, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        refresh_feats.call(character: input[:character]) if %i[classes subclasses subclasses_mastery].intersect?(input.keys)

        attach_avatar_by_file.call({ character: input[:character], file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: input[:character], url: input[:avatar_url] }) if input[:avatar_url]

        { result: input[:character] }
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
