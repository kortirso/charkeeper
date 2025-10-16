# frozen_string_literal: true

module DaggerheartCharacter
  class FeaturesBaseDecorator
    attr_accessor :wrapped

    def initialize(obj)
      @wrapped = obj
    end

    def method_missing(method, *_args)
      if instance_variable_defined?(:"@#{method}")
        instance_variable_get(:"@#{method}")
      else
        instance_variable_set(:"@#{method}", wrapped.public_send(method))
      end
    end

    def features
      available_features.each do |feature|
        next unless feature_bonuses_enabled?(feature)

        feature.feat.bonus_eval_variables&.each do |method_name, variable|
          result = eval_variable(feature.feat, variable)
          instance_variable_set(:"@#{method_name}", result) if result
        end
      end
    end

    def available_features
      @available_features ||= wrapped.feats.includes(:feat).order('feats.origin ASC, feats.created_at ASC')
    end

    private

    def feature_bonuses_enabled?(feature)
      ready_to_use = feature.value.is_a?(Hash) ? feature.value.fetch('ready_to_use', true) : true
      (!feature.feat.continious && ready_to_use) || feature.active
    end

    # rubocop: disable Security/Eval, Style/MethodCalledOnDoEndBlock
    def eval_variable(feat, variable)
      lambda do
        eval(variable)
      end.call
    rescue StandardError, SyntaxError => e
      monitoring_feat_error(e, feat)
      nil
    end
    # rubocop: enable Security/Eval, Style/MethodCalledOnDoEndBlock
  end
end
