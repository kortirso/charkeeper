# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Feats
      class CopyCommand < BaseCommand
        include Deps[
          add_feat: 'commands.homebrew_context.dnd.feats.add'
        ]

        use_contract do
          params do
            required(:feats).maybe(:array)
            required(:user).filled(type?: ::User)
            required(:origin_value).filled(:string)
          end
        end

        private

        def do_persist(input)
          input[:feats].each do |feat|
            add_feat.call(feat_attributes(input, feat).merge({ user: input[:user] }))
          end

          { result: :ok }
        end

        def feat_attributes(input, feat)
          feat
            .attributes
            .slice('origin', 'kind', 'limit_refresh', 'modifiers', 'continious', 'info', 'conditions')
            .symbolize_keys
            .merge({
              origin_value: input[:origin_value],
              title: feat.title['en'],
              description: feat.description['en'],
              limit: feat.description_eval_variables['limit'],
              level: feat.conditions['level']
            }).compact
        end
      end
    end
  end
end
