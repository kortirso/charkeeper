# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class ChangeCompanionCommand < BaseCommand
      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :character_companion

        Damages = Dry::Types['strict.string'].enum('d6', 'd8', 'd10', 'd12')
        Distances = Dry::Types['strict.string'].enum('melee', 'very close', 'close', 'far')

        params do
          required(:companion).filled(type?: ::Daggerheart::Character::Companion)
          optional(:name).filled(:string, max_size?: 50)
          optional(:leveling).hash do
            required(:intelligent).filled(:integer, gteq?: 0)
            required(:light).filled(:integer, gteq?: 0)
            required(:comfort).filled(:integer, gteq?: 0)
            required(:armored).filled(:integer, gteq?: 0)
            required(:vicious).filled(:integer, gteq?: 0)
            required(:resilient).filled(:integer, gteq?: 0)
            required(:bonded).filled(:integer, gteq?: 0)
            required(:aware).filled(:integer, gteq?: 0)
          end
          optional(:experience).maybe(:array).each(:hash) do
            required(:id).filled(:integer)
            required(:exp_name).filled(:string, max_size?: 50)
            required(:exp_level).filled(:integer, gteq?: 0)
          end
          optional(:stress_marked).filled(:integer)
          optional(:damage).filled(Damages)
          optional(:distance).filled(Distances)
          optional(:caption).filled(:string, max_size?: 100)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_prepare(input)
        input[:data_attributes] = input.except(:companion, :name, :caption).stringify_keys
        input[:attributes] = input.slice(:name, :caption)
      end

      def do_persist(input)
        input[:companion].data = input[:companion].data.attributes.merge(input[:data_attributes])
        input[:companion].assign_attributes(input[:attributes])
        input[:companion].save!

        { result: input[:companion] }
      end
    end
  end
end
