# frozen_string_literal: true

class ApplicationDecoratorV2
  include TranslateHelper
  include Deps[
    formula: 'formula',
    markdown: 'markdown',
    feature_requirement: 'feature_requirement',
    monitoring: 'monitoring.client'
  ]

  def method_missing(method, *_args)
    return @character.data if method == :data && defined?(@character)
    return @character if method == :parent && defined?(@character)

    @result[method.to_s]
  end

  private

  def monitoring_formula_error(formula)
    monitoring.notify(
      exception: Monitoring::FormulaError.new('Formula error'),
      metadata: { formula: formula },
      severity: :info
    )
  end
end
