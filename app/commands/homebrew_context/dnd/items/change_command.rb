# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Items
      class ChangeCommand < BaseCommand
        include Deps[
          formula: 'formula'
        ]

        use_contract do
          config.messages.namespace = :homebrew_item

          ConsumeAttributes = Dry::Types['strict.string'].enum('health')

          params do
            required(:item).filled(type?: ::Dnd5::Item)
            optional(:name).filled(:string, max_size?: 50)
            optional(:description).maybe(:string, max_size?: 250)
            optional(:data).hash
            optional(:info).hash
            optional(:public).filled(:bool)
            optional(:modifiers).hash
            optional(:consume).maybe(:array).each(:hash) do
              required(:id).filled(type?: Integer)
              required(:attribute).filled(ConsumeAttributes)
              required(:formula).filled(:string)
            end
          end
        end

        private

        def do_prepare(input)
          input[:name] = { en: input[:name], ru: input[:name] }
          input[:description] = { en: input[:description], ru: input[:description] }

          if input.key?(:consume)
            consume_result = input[:consume].select do |consume|
              result = formula.call(formula: consume[:formula])
              next unless result

              consume
            end
            input[:info] = { consume: consume_result } if consume_result.any?
          end
        end

        def do_persist(input)
          input[:item].update!(input.except(:item, :consume))

          { result: input[:item] }
        end
      end
    end
  end
end
