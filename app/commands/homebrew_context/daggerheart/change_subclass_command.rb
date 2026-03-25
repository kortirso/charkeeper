# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeSubclassCommand < BaseCommand
      include Deps[cache: 'cache.daggerheart_names']

      use_contract do
        config.messages.namespace = :homebrew_subclass

        params do
          required(:subclass).filled(type?: ::Daggerheart::Homebrew::Subclass)
          optional(:name).filled(:string, max_size?: 50)
          optional(:spellcast).maybe(:string)
          optional(:mechanics).maybe(:array).each(:string)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:subclass].data =
          input[:subclass].data.attributes.merge(input.slice(:spellcast, :mechanics).stringify_keys)
        input[:subclass].assign_attributes(input.slice(:name, :public))
        input[:subclass].save!

        cache.push_item(key: :subclasses, item: input[:subclass])

        { result: input[:subclass] }
      end
    end
  end
end
