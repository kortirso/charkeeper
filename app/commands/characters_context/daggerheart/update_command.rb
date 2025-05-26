# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class UpdateCommand < BaseCommand
      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :daggerheart_character
        config.validate_keys = true

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
        end

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
        %i[classes traits].each do |key|
          input[key]&.transform_values!(&:to_i)
        end
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character).stringify_keys)
        input[:character].save!

        { result: input[:character] }
      end
    end
  end
end
