# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Feats
        class ChangeCommand < BaseCommand
          KINDABLE_OPTIONS = %w[static_list many_from_list].freeze

          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity, Metrics/MethodLength
            input[:info] = { hope_dice: input[:hope_dice], fear_dice: input[:fear_dice] }
            input[:conditions] ||= {}
            if input[:feat].origin == 'subclass' && input.key?(:subclass_mastery)
              input[:conditions][:subclass_mastery] = input[:subclass_mastery]
            end
            if input[:feat].origin == 'domain_card'
              input[:conditions][:level] = input[:level]
              input[:info][:type] = input[:type]
              input[:info][:recall] = input[:recall]
            end

            input[:options] =
              if input.key?(:options) && KINDABLE_OPTIONS.include?(input[:kind])
                input[:options].each_with_object({}) do |option, acc|
                  slug = SecureRandom.uuid
                  feature = option[:feature]
                  next acc[slug] = option unless feature

                  feature[:user] = input[:user]
                  feature[:origin] = input[:origin]
                  feature[:origin_value] = ''
                  feature[:conditions] = { selected_feature: slug }

                  acc[slug] = { title: option[:title], feature: feature }
                end
              end

            input[:info] = input[:info].compact
            input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }

            input[:attributes] = input.except(
              :feat, :limit, :no_refresh, :subclass_mastery, :level, :attacks, :skip_contract_validation, :type, :recall,
              :hope_dice, :fear_dice, :options
            ).merge(options: input[:options]&.transform_values { |value| value[:title] })

            input[:attributes][:modifiers] = {} unless input.key?(:modifiers)
            input[:attributes][:tokens] = nil unless input.key?(:tokens)
            input[:attributes][:continious] = false unless input.key?(:continious)
          end

          def do_persist(input) # rubocop: disable Metrics/AbcSize
            ::Daggerheart::Feat.where(slug: input[:feat].options.keys).destroy_all if input[:feat].options

            input[:feat].update!(input[:attributes])
            input[:feat].character_feats.update_all(tokens: input[:feat].tokens.nil? ? nil : 0)

            input[:options]&.values&.each do |option|
              next unless option[:feature]

              add_feat_command.call(**option[:feature])
            end

            { result: :ok }
          end

          def add_feat_command = Charkeeper::Container.resolve('commands.homebrews_v2_context.import.daggerheart.feats.add')
        end
      end
    end
  end
end
