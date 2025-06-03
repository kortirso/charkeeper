# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class UpdateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :daggerheart_character

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          optional(:classes).hash
          optional(:traits).hash do
            required(:str).filled(:integer)
            required(:agi).filled(:integer)
            required(:fin).filled(:integer)
            required(:ins).filled(:integer)
            required(:pre).filled(:integer)
            required(:know).filled(:integer)
          end
          optional(:health).hash do
            required(:marked).filled(:integer)
            required(:max).filled(:integer)
          end
          optional(:stress).hash do
            required(:marked).filled(:integer)
            required(:max).filled(:integer)
          end
          optional(:hope).hash do
            required(:marked).filled(:integer) # TODO: marked не может быть больше max
            required(:max).filled(:integer)
          end
          optional(:gold).hash do
            required(:coins).filled(:integer) # TODO: если значение 10, то увеличивать на 1 нижестоящий
            required(:handfuls).filled(:integer)
            required(:bags).filled(:integer)
            required(:chests).filled(:integer)
          end
          optional(:energy).hash
          optional(:name).filled(:string)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
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

        attach_avatar_by_file.call({ character: input[:character], file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: input[:character], url: input[:avatar_url] }) if input[:avatar_url]

        { result: input[:character] }
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
